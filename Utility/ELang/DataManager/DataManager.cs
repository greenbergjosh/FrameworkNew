using System.Collections.Generic;
using System.Linq;

// This class allows access to data
// The data may be in many different underlying stores
//  1. A relational database on disk (accessed via SQL)
//  2. A distributed cache (e.g. redis)
//  3. A local cache (e.g. ConcurrentDictionary)
//  4. Arguments passed in directly in the form of List<Dictionary<string, object>>

// The goal of the class is to read configuration (stored in a file or database)
// and to expose an interface, described by that configuration, that enables access
// to the underlying data. Where specified by the configuration, the data can be
// cached in this class to enhance performance. If the data is cached, the cache
// will allow specification of refresh intervals, external signals to cause refresh,
// etc.

// This class should be usable from a callback-based subscriber or from a method based
// subscriber. In other words, this class will be responsible for maintaining the state
// of an enumeration over a given node of the data source.

// This class should be thread-safe, allowing multiple readers, each with their own enumeration state.
// Different cache classes will support different write characteristics. 

// This class will cache connections to databases or distributed caches or other data sources

/*
<root>
  <connection>
    <sqlconnection name=''></sqlconnection>
    <redisconnection name=''></redisconnection>
  </connection>
  <primitive>
    <name>TestName</name>
    <value>TestValue</value>
    <type>System.Int32</type>
    <toString></toString>
    <read></read>
    <cache></cache>
    <uiCtrl></uiCtrl>
  </primitive>
  <composite>
    <name>TestComposite</name>
    <value>
      <primitive></primitive>...<primitive></primitive>
    </value>
    <read useconnection=''>
      <sql>SELECT a, b, c FROM xyz
    </read>
    <cache><refreshInterval>1</refreshInterval></cache>
    <uiCtrl></uiCtrl>
  </composite>
  <list>
    <name>TestList</name>
    <value>
      <primitive|composite></primitive|composite>...<primitive|composite></primitive|composite>
    </value>
    <read useconnection=''>
      <redis>However redis is queried</redis>
      <!-- <cache> no caching so the element does not appear </cache> -->
    </read>
  </list>
</root>
*/

namespace DataManager
{
    // The DataManager wraps the different types of caches
    // The structure of the data in the data manager is defined by its configuration file
    // The configuration files can explicitly specify a particular cache, or can specify to search from closest to furthest
    // The idea of the data manager is to abstract away the differences between the underlying caches by providing a data model
    //  that can be used to access the data regardless of its location. This data model is fully defined by the configuration file.
    // The data model does not need to be completely identified as the DataManager will allow recursive navigation by dynamic string name.
    //  However, if navigation is done by dynamic string name, navigation will remain within the cache that was explicitly identified as
    //  the starting point, or within the cache in which the starting point was found (closest distance).
    public class DataManager : GenericEntityBase
    {
        private IGenericEntity _configuration;
        private readonly Dictionary<string, IDataLifespan> _lifespans = new Dictionary<string, IDataLifespan>();

        public DataManager() { }

        public void AddLifespanEntity(IDataLifespan dataLifespan) => _lifespans.Add(dataLifespan.Name, dataLifespan);

        public override void InitializeEntity(object configuration, object data) => _configuration = configuration as IGenericEntity;

        public override object this[string path]
        {
            get
            {
                // The path will contain enough information to select the correct DataLifespan* using a letter pattern
                // (Nearest to Furthest O/path)
                // (Based on configuration graph G/<graphName>/path)
                var segments = path.Split('/');
                var pathWithoutFirstSegment = string.Join("/", segments.Skip(1));
                return _lifespans[segments[0]][pathWithoutFirstSegment];
            }
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            var segments = path.Split('/');
            var pathWithoutFirstSegment = string.Join("/", segments.Skip(1));
            foreach (var item in _lifespans[segments[0]].GetL(path))
            {
                yield return item;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            var segments = path.Split('/');
            var pathWithoutFirstSegment = string.Join("/", segments.Skip(1));
            return _lifespans[segments[0]].GetE(path);
        }
    }
}
