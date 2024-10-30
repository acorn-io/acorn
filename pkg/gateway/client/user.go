package client

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/otto8-ai/otto8/pkg/gateway/types"
	"github.com/otto8-ai/otto8/pkg/proxy"
	"gorm.io/gorm"
)

func (c *Client) User(ctx context.Context, username string) (*types.User, error) {
	u := new(types.User)
	return u, c.db.WithContext(ctx).Where("username = ?", username).First(u).Error
}

func (c *Client) UpdateProfileIconIfNeeded(ctx context.Context, user *types.User, authProviderID uint) error {
	if authProviderID == 0 {
		return nil
	}

	accessToken := proxy.GetAccessToken(ctx)
	if accessToken == "" {
		return nil
	}

	var (
		authProvider types.AuthProvider
		identity     types.Identity
	)
	if err := c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id = ?", authProviderID).First(&authProvider).Error; err != nil {
			return err
		}

		return tx.Where("user_id = ?", user.ID).Where("auth_provider_id = ?", authProviderID).First(&identity).Error
	}); err != nil {
		return err
	}

	if time.Until(identity.IconLastChecked) > -7*24*time.Hour {
		// Icon was checked less than 7 days ago.
		return nil
	}

	profileIconURL, err := c.fetchProfileIconURL(ctx, authProvider, accessToken)
	if err != nil {
		return err
	}

	user.IconURL = profileIconURL
	identity.IconURL = profileIconURL
	identity.IconLastChecked = time.Now()

	return c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Updates(user).Error; err != nil {
			return err
		}
		return tx.Updates(&identity).Error
	})
}

func (c *Client) fetchProfileIconURL(ctx context.Context, authProvider types.AuthProvider, accessToken string) (string, error) {
	switch authProvider.Type {
	case types.AuthTypeGoogle:
		return c.fetchGoogleProfileIconURL(ctx, accessToken)
	default:
		return "", fmt.Errorf("unsupported auth provider type for icon fetch: %s", authProvider.Type)
	}
}

type googleProfile struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	HD            string `json:"hd"`
}

func (c *Client) fetchGoogleProfileIconURL(ctx context.Context, accessToken string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://www.googleapis.com/oauth2/v1/userinfo", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var profile googleProfile
	if err = json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return "", err
	}

	return profile.Picture, nil
}
