namespace Utility.Mta
{
    public interface IEmailEncoder
    {
        bool HasTransferEncoding();
        string GetTransferEncodingHeaderValue();
        string GetCharSet();
        string Encode(string body);
    }
}