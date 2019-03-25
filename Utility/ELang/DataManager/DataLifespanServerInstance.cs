namespace DataManager
{
    // Data that lives in a distributed cache, a database, or a third-party store, but is locally cached in the application process
    // This data is a fast-access cache because it is in-process
    // This data is lost if the machine fails or is restarted
    // This data is shared by all sessions
    // Probably should be a custom cache with an option to use SQLLite (for transactions, multiple indexes, etc.)
    // Goal is to get a multi-indexed cache with pokability and expiration
    public class DataLifespanServerInstance
    {
        //public DataLifespanServerInstance()
        //{
        //    try
        //    {
        //        SQLiteConnection c = new SQLiteConnection("Data Source=:memory:;Version=3;New=True;");
        //        c.Open();

        //        string createCmdStr = @"CREATE TABLE Person
        //       (Id INTEGER NOT NULL,
        //        FirstName TEXT,
        //        LastName TEXT,
        //        SocialSecurity TEXT,
        //       PRIMARY KEY (Id),
        //       UNIQUE (SocialSecurity));

        //       INSERT INTO Person (Id, FirstName, LastName, SocialSecurity) VALUES (1, 'Bob', 'Smith', '234-56-7890');
        //       ";

        //        SQLiteCommand createCmd = new SQLiteCommand(createCmdStr, c);
        //        createCmd.ExecuteNonQuery();

        //        SQLiteDataAdapter da;
        //        DataSet ds = new DataSet();
        //        DataTable dt = new DataTable();

        //        // Specify command below
        //        da = new SQLiteDataAdapter("SELECT * FROM Person", c);
        //        ds.Reset();
        //        da.Fill(ds);
        //        dt = ds.Tables[0];

        //        // THe following segment updates the listview
        //        DataTable dtable = new DataTable();

        //        for (int i = 0; i < dt.Rows.Count; i++)
        //        {
        //            DataRow drow = dt.Rows[i];

        //            // Only row that have not been deleted
        //            if (drow.RowState != DataRowState.Deleted)
        //            {
        //            }
        //        }
        //        c.Close();

        //    }
        //    catch (Exception e)
        //    {
        //        // If an exception is thrown it is probably because the database already exists
        //        // ... just delete it, or add a delete clause at the beginning of your program
        //    }
        //}
    }
}
