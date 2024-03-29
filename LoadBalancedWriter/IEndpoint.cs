﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace LoadBalancedWriter
{
    public interface IEndpoint
    {
        Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds);
        Task<bool> Audit();
    }
}
