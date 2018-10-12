namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Prueba : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Accounts",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Name = c.String(),
                        LastName = c.String(),
                        UserName = c.String(),
                        Password = c.String(),
                        Provider_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Providers", t => t.Provider_Id)
                .Index(t => t.Provider_Id);
            
            CreateTable(
                "dbo.Providers",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Name = c.String(),
                        Server = c.String(),
                        Port = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Contents",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        HtmlBody = c.String(),
                        TextBody = c.String(),
                        Mail_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Mails", t => t.Mail_Id)
                .Index(t => t.Mail_Id);
            
            CreateTable(
                "dbo.Mails",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        FolderName = c.String(),
                        Date = c.DateTimeOffset(nullable: false, precision: 7),
                        MessageId = c.String(),
                        Importance = c.Int(nullable: false),
                        InReplayTo = c.String(),
                        ResentDate = c.DateTimeOffset(nullable: false, precision: 7),
                        ResentMessageId = c.String(),
                        Subject = c.String(),
                        XPriority = c.Int(nullable: false),
                        HtmlBody = c.String(),
                        TextBody = c.String(),
                        Priority = c.Int(nullable: false),
                        Account_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Accounts", t => t.Account_Id)
                .Index(t => t.Account_Id);
            
            CreateTable(
                "dbo.Headers",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Field = c.String(),
                        Offset = c.Long(nullable: false),
                        RawField = c.Binary(),
                        RawValue = c.Binary(),
                        Value = c.String(),
                        MailHeader_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.MailHeaders", t => t.MailHeader_Id)
                .Index(t => t.MailHeader_Id);
            
            CreateTable(
                "dbo.MailHeaders",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Mail_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Mails", t => t.Mail_Id)
                .Index(t => t.Mail_Id);
            
            CreateTable(
                "dbo.Pruebas",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Apellido = c.String(),
                        Column = c.String(),
                    })
                .PrimaryKey(t => t.ID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.MailHeaders", "Mail_Id", "dbo.Mails");
            DropForeignKey("dbo.Headers", "MailHeader_Id", "dbo.MailHeaders");
            DropForeignKey("dbo.Contents", "Mail_Id", "dbo.Mails");
            DropForeignKey("dbo.Mails", "Account_Id", "dbo.Accounts");
            DropForeignKey("dbo.Accounts", "Provider_Id", "dbo.Providers");
            DropIndex("dbo.MailHeaders", new[] { "Mail_Id" });
            DropIndex("dbo.Headers", new[] { "MailHeader_Id" });
            DropIndex("dbo.Mails", new[] { "Account_Id" });
            DropIndex("dbo.Contents", new[] { "Mail_Id" });
            DropIndex("dbo.Accounts", new[] { "Provider_Id" });
            DropTable("dbo.Pruebas");
            DropTable("dbo.MailHeaders");
            DropTable("dbo.Headers");
            DropTable("dbo.Mails");
            DropTable("dbo.Contents");
            DropTable("dbo.Providers");
            DropTable("dbo.Accounts");
        }
    }
}
