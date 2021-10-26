using System;
using System.Data.SqlClient;
using System.IO;
using System.Xml;

namespace DataManager
{
    // This data is maitained in a store such as a relational database or third party service
    // This data is not cached, and will cause a call to be made to retrieve the data each time it is required
    public class DataProviderSqlDatabase
    {

        public static XmlDocument RetrieveFromDatabase()
        {
            string query = "";
            XmlDocument xml = new XmlDocument();

            try
            {   // Open the text file using a stream reader.
                using (StreamReader sr = new StreamReader("\\\\fs2\\user$\\jgreenberg\\Desktop\\AfterReplace.sql"))
                {
                    // Read the stream to a string, and write the string to the console.
                    query = sr.ReadToEnd();
                }
            }
            catch (Exception exc)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(exc.Message);
            }
            //string connectionString = "Data Source=testsql;Initial Catalog=RMCMS;User ID=webuser;Password=GetTheData";
            string connectionString = "Data Source=sql3;Initial Catalog=RMCMS;User ID=webuser;Password=GetTheData";
            using (SqlConnection c = new SqlConnection(connectionString))
            {
                try
                {
                    c.Open();
                    SqlCommand com = new SqlCommand(query, c);
                    XmlReader rdr = com.ExecuteXmlReader();                    
                    xml.Load(rdr);
                }
                catch (Exception e)
                {
                    string es = e.ToString();
                }
            }

            return xml;

        }
    }
}
