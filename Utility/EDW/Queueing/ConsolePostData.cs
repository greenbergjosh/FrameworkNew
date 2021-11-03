
namespace Utility.EDW.Queueing
{
    public class ConsolePostData
    {

        public ConsolePostData(string domainId, string firstName, string lastName, string zipCode, string email, string dob, string labelDomain, string gender, string ip)
        {
            first_name = firstName;
            last_name = lastName;
            zip_code = zipCode;
            this.email = email;
            this.dob = dob;
            label_domain = labelDomain;
            this.gender = gender;
            domain_id = domainId;
            user_ip = ip;
        }

        // ReSharper disable InconsistentNaming
#pragma warning disable IDE1006 // Naming Styles
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string zip_code { get; set; }
        public string email { get; set; }
        public string dob { get; set; }
        public string label_domain { get; set; }
        public string gender { get; set; }
        public string domain_id { get; set; }
        public bool isFinal { get; set; } = true;
        public string user_ip { get; set; }
#pragma warning restore IDE1006 // Naming Styles
        // ReSharper restore InconsistentNaming
    }
}
