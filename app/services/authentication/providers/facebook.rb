module Authentication
  module Providers
    # Facbook authentication provider, uses omniauth-facebook as backend
    class Facebook < Provider
      OFFICIAL_NAME = "Facebook".freeze
      SETTINGS_URL = "https://www.facebook.com/settings?tab=applications".freeze

      def new_user_data
        puts "Facebook.new_user_data: Here's what I got for info: #{@info}"
        puts "Facebook.new_user_data: Here's what I got for raw_info: #{@raw_info}"
        {
          name: 'bob',
          username: 'bob',
          email: 'bob@bobco.com'
        }
      end

      def existing_user_data
        puts "Facebook.existing_user_data: Here's what I got for info: #{@info}"
        puts "Facebook.existing_user_data: Here's what I got for raw_info: #{@raw_info}"
        {
          name: 'bob',
          username: 'bob',
          email: 'bob@bobco.com'
        }
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
