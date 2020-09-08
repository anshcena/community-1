module Authentication
  module Providers
    # Google authentication provider, uses omniauth-google-oauth2 as backend
    class GoogleOauth2 < Provider
      OFFICIAL_NAME = "Google Oauth2".freeze
      SETTINGS_URL = "https://console.developers.google.com/apis/credentials".freeze

      def new_user_data
        {
          name: @info.name,
          email: @info.email || "",
          remote_profile_image_url: @info.image,
          google_username: user_nickname,
          google_created_at: Time.zone.now
        }
      end

      def existing_user_data
        {
          google_username: @info.name,
          google_created_at: Time.zone.now
        }
      end

      # We're overriding this method because Google doesn't have a concept of nickname or username.
      # Instead: we'll construct one based on the user's name with some randomization thrown in based
      # on uid, which is guaranteed to be present and unique on Facebook.
      def user_nickname
        [
          info.name.sub(" ", "_"),
          Digest::SHA512.hexdigest(@auth_payload.uid),
        ].join("_")[0...25]
      end

      def self.official_name
        OFFICIAL_NAME
      end

      def self.settings_url
        SETTINGS_URL
      end

      def self.sign_in_path(**kwargs)
        ::Authentication::Paths.sign_in_path(
          provider_name,
          **kwargs,
        )
      end

      protected

      def cleanup_payload(auth_payload)
        auth_payload
      end
    end
  end
end
