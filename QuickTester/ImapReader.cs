using System;
using System.Collections.Generic;
using System.Text;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;

namespace QuickTester
{
    public class ImapReader
    {
        private string _mailServer;
        private string _login;
        private string _password;
        private int _port;
        private bool _ssl;

        public ImapReader(string mailServer, string login, string password, int port, bool ssl)
        {
            _mailServer = mailServer;
            _login = login;
            _password = password;
            _port = port;
            _ssl = ssl;
        }

        public IEnumerable<MimeMessage> GetAllMailsSince(DateTime dateTime)
        {
            using var client = new ImapClient();

            client.Connect(_mailServer, _port, _ssl);

            // Note: since we don't have an OAuth2 token, disable
            // the XOAUTH2 authentication mechanism.
            client.AuthenticationMechanisms.Remove("XOAUTH2");

            client.Authenticate(_login, _password);

            // The Inbox folder is always available on all IMAP servers...
            var inbox = client.Inbox;
            inbox.Open(FolderAccess.ReadOnly);
            var results = inbox.Search(SearchOptions.All, SearchQuery.SentSince(dateTime));
            foreach (var uniqueId in results.UniqueIds)
            {
                var message = inbox.GetMessage(uniqueId);

                yield return message;
            }

            client.Disconnect(true);
        }

        public int Count()
        {
            using var client = new ImapClient();

            client.Connect(_mailServer, _port, _ssl);

            // Note: since we don't have an OAuth2 token, disable
            // the XOAUTH2 authentication mechanism.
            client.AuthenticationMechanisms.Remove("XOAUTH2");

            client.Authenticate(_login, _password);

            // The Inbox folder is always available on all IMAP servers...
            var inbox = client.Inbox;
            inbox.Open(FolderAccess.ReadOnly);
            var results = inbox.Search(SearchOptions.All, SearchQuery.And(SearchQuery.FromContains("info@onpointglobal.com"), SearchQuery.SubjectContains("CCPA Opt-Out")));

            client.Disconnect(true);

            return results.Count;
        }
    }
}
