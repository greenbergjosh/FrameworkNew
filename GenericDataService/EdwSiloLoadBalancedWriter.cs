using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace GenericDataService
{
    public class EdwSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public EdwSiloLoadBalancedWriter(int endpointPollingInterval,
            InitiateWalkawayDelegate td,
            NextWalkawayValueDelegate badEndpointWalkaway,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate invalid,
            UnhandledExceptionDelegate unhandled)
            : base(endpointPollingInterval, td, badEndpointWalkaway,
                selector, novalid, invalid, unhandled) { }

        public override async Task<List<IEndpoint>> InitializeEndpoints()
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();

            // Read these from configuration file or database
            EdwSiloEndpoint silo1 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;");
            EdwSiloEndpoint silo2 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo2;Integrated Security=SSPI;");
            EdwSiloEndpoint silo3 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo3;Integrated Security=SSPI;");

            endpoints.Add(silo1);
            endpoints.Add(silo2);
            endpoints.Add(silo3);

            return endpoints;
        }

        public override async Task<List<IEndpoint>> PollEndpoints()
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();

            // Read these from configuration file or database
            EdwSiloEndpoint silo1 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;");
            EdwSiloEndpoint silo2 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo2;Integrated Security=SSPI;");
            EdwSiloEndpoint silo3 = new EdwSiloEndpoint("Data Source=.;Initial Catalog=Silo3;Integrated Security=SSPI;");

            endpoints.Add(silo1);
            endpoints.Add(silo2);
            endpoints.Add(silo3);

            return endpoints;
        }

        public static async Task InitiateWalkaway(object w, int timeoutSeconds)
        {
            string silo1 = "Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;";
            await EdwSiloEndpoint.ExecuteSql("Walkaway - " + (string)w, "[dbo].[spCreateTestRecord]", silo1)
                    .ConfigureAwait(false);
        }

        public static int NextWalkawayValue(int previousValue)
        {
            if (previousValue == 0) return 1;
            else if (previousValue == 1) return 5;
            else if (previousValue == 5) return 60;
            else return 0;
        }

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen)
        {
            IEndpoint e = null;
            List<IEndpoint> es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                e = es[i];
                if (!alreadyChosen.Contains(e) && endpoints[e].Item1) break;
                i = (i + 1) % es.Count;
            }
            return e;
        }

        public static async Task NoValid(object w)
        {
            string silo1 = "Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;";
            await EdwSiloEndpoint.ExecuteSql("NoValid - " + (string)w, "[dbo].[spCreateTestRecord]", silo1)
                    .ConfigureAwait(false);
        }

        public static async Task Failure(object w)
        {
            string silo1 = "Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;";
            await EdwSiloEndpoint.ExecuteSql("Failure - " + (string)w, "[dbo].[spCreateTestRecord]", silo1)
                    .ConfigureAwait(false);
        }

        public static async Task Unhandled(object w, Exception ex)
        {
            string silo1 = "Data Source=.;Initial Catalog=Silo1;Integrated Security=SSPI;";
            await EdwSiloEndpoint.ExecuteSql("Unhandled - " + (string)w, "[dbo].[spCreateTestRecord]", silo1)
                    .ConfigureAwait(false);
        }
 
    }
}
