﻿using System;
using System.Threading.Tasks;
using Utility;

namespace UnsubLib.UnsubFileProviders
{
    // TODO: Make this use Roslyn instead of OO style
    public interface IUnsubLocationProvider
    {
        Task<string> GetFileUrl(IGenericEntity network, Uri uri);
    }

}
