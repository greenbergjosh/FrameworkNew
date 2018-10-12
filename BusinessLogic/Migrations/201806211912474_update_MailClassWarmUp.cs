namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_MailClassWarmUp : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.MailClassWarmUps", "CreatedAt", c => c.DateTime(nullable: false));
            AddColumn("dbo.MailClassWarmUps", "UpdatedAt", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.MailClassWarmUps", "UpdatedAt");
            DropColumn("dbo.MailClassWarmUps", "CreatedAt");
        }
    }
}
