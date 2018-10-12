namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_mailClassWarmUp : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.MailClassWarmUps",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        MailClass = c.String(),
                        PortionMail = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.MailClassWarmUps");
        }
    }
}
