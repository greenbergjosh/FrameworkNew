namespace Utility.Mta
{
    public class Sender
    {
        public Sender() { }

        public Sender(string name, string localPart, string domain)
        {
            Name = name;
            LocalPart = localPart;
            Domain = domain;
        }

        public string Name { get; set; }
        public string LocalPart { get; set; }
        public string Domain { get; set; }

        public string Address => $"{LocalPart}@{Domain}";
        public string FromHeader => $"{Name} <{LocalPart}@{Domain}>";
    }
}