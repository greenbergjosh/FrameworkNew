namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class deletePrueba : DbMigration
    {
        public override void Up()
        {
            DropTable("dbo.Pruebas");
        }
        
        public override void Down()
        {
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
    }
}
