namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addSeedBucket : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.SeedBuckets",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Name = c.String(),
                        Description = c.String(),
                        CreatedAt = c.DateTime(nullable: false, defaultValueSql: "GETUTCDATE()"),
                        UpdatedAt = c.DateTime(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.SeedBuckets");
        }
    }
}
