class AddGoogleLoginFields < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :google_oauth2_username, :string
    add_column :users, :google_oauth2_created_at, :datetime
  end
end
