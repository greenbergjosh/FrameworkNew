using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

namespace SimpleImportExport
{
    public enum EndpointType
    {
        Local, Ftp
    }

    public class SourceFileInfo
    {
        public SourceFileInfo(string sourceDirectory, string fileName) : this(sourceDirectory, fileName, null, null, null) { }

        public SourceFileInfo(string sourceDirectory, string fileName, Pattern pattern, DateTime? fileDate, Dictionary<string, string> additionalFields)
        {
            SourceDirectory = sourceDirectory;
            FileName = fileName;
            Pattern = pattern;
            FileDate = fileDate;
            AdditionalFields = pattern?.AdditionalFields == null ? null : new ReadOnlyDictionary<string, string>(pattern.AdditionalFields.GroupJoin(additionalFields, f => f, p => p.Key, (key, values) => new { key, value = values?.FirstOrDefault().Value }).ToDictionary(p => p.key, p => p.value));
        }

        public string SourceDirectory { get; }
        public string FileName { get; }
        public Pattern Pattern { get; }
        public DateTime? FileDate { get; }
        public ReadOnlyDictionary<string, string> AdditionalFields { get; }
    }

    public abstract class Endpoint
    {
        protected async Task LoadPatterns(Entity ge) => Patterns = (await (await ge.GetL("Patterns")).Select(async p => await Pattern.Create(p))).ToArray();

        public abstract EndpointType Type { get; }
        public abstract Task<Stream> GetStream(SourceFileInfo file);
        public abstract Task<(long size, long? records, string destinationDirectoryPath)> SendStream(SourceFileInfo file, Endpoint source);
        public abstract Task<IEnumerable<SourceFileInfo>> GetFiles();
        public abstract Task Delete(string directoryPath, string fileName);
        public Task Move(string directoryPath, string fileName, string relativeBasePath) => Move(directoryPath, fileName, relativeBasePath, false);
        public abstract Task Move(string directoryPath, string fileName, string relativeBasePath, bool overwrite);
        public Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace) => Rename(directoryPath, fileName, pattern, patternReplace, false);
        public abstract Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace, bool overwrite);
        protected IEnumerable<Pattern> Patterns { get; private set; }

        protected IEnumerable<SourceFileInfo> Filter(ICollection<(SourceFileInfo file, string matchString)> files)
        {
            if (files?.Any() == true && Patterns?.Any() == true)
            {
                return Patterns.SelectMany(p => files.Select(f => new { match = ApplyPattern(p, f.matchString), sourceFile = f.file }).Where(f => f.match.isMatch)
                        .Select(f => new SourceFileInfo(f.sourceFile.SourceDirectory, f.sourceFile.FileName, p, f.match.fileDate, f.match.additionalFields))).ToArray();
            }

            return files?.Select(f => f.file);
        }

        protected (bool isMatch, DateTime? fileDate, string filePath, Dictionary<string, string> additionalFields) ApplyPattern(Pattern pattern, string filePath)
        {
            var match = pattern.Rx.Match(filePath);
            var isMatch = match.Success;
            DateTime? fileDate = null;
            var additionalFields = new Dictionary<string, string>();

            if (isMatch && !pattern.FileDateFormat.IsNullOrWhitespace())
            {
                var fileDateStr = match.Groups.Cast<Group>().FirstOrDefault(g => g.Name == "fileDate")?.Value;

                if (!fileDateStr.IsNullOrWhitespace())
                {
                    try
                    {
                        fileDate = DateTime.ParseExact(fileDateStr, pattern.FileDateFormat, null);
                    }
                    catch (Exception e)
                    {
                        Program._fw.Error($"{GetType().Name}.{nameof(GetFiles)}.{nameof(ApplyPattern)}", $"Failed to parse date: Endpoint: {this} File: {filePath} Pattern: {JsonSerializer.Serialize(pattern)}\r\n{e.UnwrapForLog()}").GetAwaiter().GetResult();
                        isMatch = false;
                    }
                }

                foreach (var p in pattern.AdditionalFields.Select(field => new { field, match.Groups[field]?.Value }).Where(p => !p.Value.IsNullOrWhitespace()))
                {
                    additionalFields.Add(p.field, p.Value);
                }
            }

            return (isMatch, fileDate, filePath, additionalFields);
        }

        protected static string CombineUrl(params string[] list) => list.Select(i => i?.Trim('/')).Where(i => !i.IsNullOrWhitespace()).Join("/");
    }
}