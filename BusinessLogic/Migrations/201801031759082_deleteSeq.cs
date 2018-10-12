namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class deleteSeq : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.Headers", "Seq");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Headers", "Seq", c => c.Int(nullable: false));
        }
    }
}
