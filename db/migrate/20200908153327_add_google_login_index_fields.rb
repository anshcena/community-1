class AddGoogleLoginIndexFields < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_index :users, :google_oauth2_username, algorithm: :concurrently
  end
end
