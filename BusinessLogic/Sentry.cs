using SharpRaven;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic
{
    public class Sentry
    {
        private static RavenClient instance;

        private Sentry() { }

        public static RavenClient Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new RavenClient("https://14d36409f7f14a05a3ac095601ee6db0:9f5e6ad2ecd4492cbd55f3e0a709023d@sentry.io/262308");
                }
                return instance;
            }
        }
    }
}
