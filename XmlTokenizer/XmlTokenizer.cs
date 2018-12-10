using Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Xml;


namespace XmlTokenizer
{
    public class XmlTokenizer
    {
        public static string TokenReplaceXmlR =
                @"
                    XmlNodeList tokenizedAttributeNodes = p.pn.SelectNodes(""descendant-or-self::*/@*[starts-with(.,'[=') and substring(., string-length(.)-1,2) = '=]' and not(ancestor-or-self::*[@TokenizerReplace])]"", s.r.nsmgr);                   
                    foreach (XmlNode xn in tokenizedAttributeNodes)
                    {
                        string er = (string) await f.Evaluate(xn.InnerText.Substring(2, xn.InnerText.Length - 4), new {ge = p.ge}, s);
                        if (er == null) ((XmlAttribute)xn).OwnerElement.RemoveAttribute(xn.Name);
                        else xn.InnerText = er;
                    }

                    XmlNodeList tokenizedElementNodes = p.pn.SelectNodes(""descendant-or-self::*[text()[starts-with(.,'[=') and substring(., string-length(.)-1,2) = '=]'] and not(ancestor-or-self::*[@TokenizerReplace])]"", s.r.nsmgr);
                    foreach (XmlNode xn in tokenizedElementNodes)
                    {
                        string er = (string) await f.Evaluate(xn.InnerText.Substring(2, xn.InnerText.Length - 4), new {ge = p.ge}, s);
                        xn.InnerText = er == null ? """" : er;
                    }

                    XmlNodeList elementsToBeReplaced = p.pn.SelectNodes(""descendant-or-self::*[(@TokenizerReplace) and not(ancestor::*[@TokenizerReplace])]"", s.r.nsmgr);
                    foreach (XmlNode xn in elementsToBeReplaced)
                    {
                      string val = xn.Attributes[""TokenizerReplace""].InnerText;
                      string gePath = p.XmlGeMap[val];
                      foreach (var x in p.ge.GetL(gePath))
                      {
                        XmlNode cln = xn.Clone();
                        ((XmlElement)cln).RemoveAttribute(""TokenizerReplace"");
                        await f.TokenReplaceXmlR(new {pn = cln, ge = x}, s);
                        xn.ParentNode.AppendChild(cln);
                      }
                      xn.ParentNode.RemoveChild(xn);
                    }""""";

        
        public static async Task<XmlDocument> TokenReplaceXml(string xmlFile, string jsonFile,
            Dictionary<string, string> xmlGeMap,
            Dictionary<string, string> ns, 
            RoslynWrapper rw)
        {
            rw.CompileAndCache(new ScriptDescriptor(null, "TokenReplaceXmlR", XmlTokenizer.TokenReplaceXmlR, false, null));

            StateWrapper sw = new StateWrapper();
            XmlDocument xml = new XmlDocument();
            xml.Load(xmlFile);
            XmlNamespaceManager nsmgr = new XmlNamespaceManager(xml.NameTable);
            foreach (string key in ns.Keys) nsmgr.AddNamespace(key, ns[key]);
            sw.r.xml = xml.DocumentElement;
            sw.r.nsmgr = nsmgr;
            IGenericEntity ge = new GenericEntityJson();
            string strState = File.ReadAllText(jsonFile);
            var state = (JObject)JsonConvert.DeserializeObject(strState);
            ge.InitializeEntity(rw, null, state);
            sw.r.ge = ge;
            
            var fno = await ((dynamic)rw).TokenReplaceXmlR(new { pn = xml.DocumentElement, ge = ge, XmlGeMap = xmlGeMap }, sw);
            return xml;
        }

        public static async Task<XmlDocument> TokenReplaceXml(XmlDocument xml, JObject state,
            Dictionary<string, string> xmlGeMap,
            Dictionary<string, string> ns,
            RoslynWrapper rw)
        {
            rw.CompileAndCache(new ScriptDescriptor(null, "TokenReplaceXmlR", XmlTokenizer.TokenReplaceXmlR, false, null));

            StateWrapper sw = new StateWrapper();
            XmlNamespaceManager nsmgr = new XmlNamespaceManager(xml.NameTable);
            foreach (string key in ns.Keys) nsmgr.AddNamespace(key, ns[key]);
            sw.r.xml = xml.DocumentElement;
            sw.r.nsmgr = nsmgr;
            IGenericEntity ge = new GenericEntityJson();
            ge.InitializeEntity(rw, null, state);
            sw.r.ge = ge;

            var fno = await ((dynamic)rw).TokenReplaceXmlR(new { pn = xml.DocumentElement, ge = ge, XmlGeMap = xmlGeMap }, sw);
            return xml;
        }
    }
}
