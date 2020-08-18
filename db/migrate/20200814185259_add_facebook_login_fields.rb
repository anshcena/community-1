class AddFacebookLoginFields < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :facebook_created_at, :datetime
    add_column :users, :facebook_username, :string
  end
end
