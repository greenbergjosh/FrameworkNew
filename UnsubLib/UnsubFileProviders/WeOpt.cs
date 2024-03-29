﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    internal class WeOpt : IUnsubLocationProvider
    {
        public Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString().Contains("weopt.com"));

        public Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri)
        {
            var pathParts = uri.AbsolutePath.Split('/');
            var fileId = pathParts[^1];

            var url = $"https://weopt.com/api/suppression_downloads/full_file/{fileId}";

            return Task.FromResult((url, (IDictionary<string, string>)null));
        }
    }
}
