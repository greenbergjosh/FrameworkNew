﻿//
// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Amazon Software License (the "License").
// You may not use this file except in compliance with the License.
// A copy of the License is located at
//
//  http://aws.amazon.com/asl/
//
// or in the "license" file accompanying this file. This file is distributed
// on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing
// permissions and limitations under the License.
//

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using CommandLine;
using Microsoft.Win32;
using Utility;

namespace Amazon.Kinesis.ClientLibrary.Bootstrap
{
    /// <summary>
    /// Represents a Maven java package. We need to download a bunch of these in order
    /// to use the java KCL.
    /// </summary>
    internal class MavenPackage
    {
        public readonly string GroupId;
        public readonly string ArtifactId;
        public readonly string Version;

        /// <summary>
        /// Gets the name of the jar file of this Maven package.
        /// </summary>
        /// <value>The name of the jar file.</value>
        public string FileName => string.Format("{0}-{1}.jar", ArtifactId, Version);

        public MavenPackage(string groupId, string artifactId, string version)
        {
            GroupId = groupId;
            ArtifactId = artifactId;
            Version = version;
        }

        /// <summary>
        /// Check if the jar file for this Maven package already exists on disk.
        /// </summary>
        /// <param name="folder">Folder to look in.</param>
        public bool Exists(string folder) => File.Exists(Path.Combine(folder, FileName));

        /// <summary>
        /// Download the jar file for this Maven package.
        /// </summary>
        /// <param name="folder">Folder to download the file into.</param>
        public void Fetch(string folder)
        {
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            var destination = Path.Combine(folder, FileName);
            if (!File.Exists(destination))
            {
                var client = new System.Net.WebClient();
                Console.Error.WriteLine(Url + " --> " + destination);
                client.DownloadFile(new Uri(Url), destination);
            }
        }

        /// <summary>
        /// Gets the URL to the jar file for this Maven package.
        /// </summary>
        /// <value>The URL.</value>
        private string Url
        {
            get
            {
                var urlParts = new List<string>();
                urlParts.AddRange(GroupId.Split('.'));
                urlParts.Add(ArtifactId);
                urlParts.Add(Version);
                urlParts.Add(FileName);
                return "https://search.maven.org/remotecontent?filepath=" + string.Join("/", urlParts);
            }
        }
    }

    /// <summary>
    /// Command line options.
    /// </summary>
    internal class Options
    {
        [Option('j', "java", Required = false,
            HelpText =
                "Path to java, used to start the KCL multi-lang daemon. Attempts to auto-detect if not specified.")]
        public string JavaLocation { get; set; }

        [Option('p', "properties", Required = true, HelpText = "Path to properties file used to configure the KCL.")]
        public string PropertiesFile { get; set; }

        [Option("jar-folder", Required = false, HelpText = "Folder to place required jars in. Defaults to ./jars")]
        public string JarFolder { get; set; }

        [Option('e', "execute", HelpText =
            "Actually launch the KCL. If not specified, prints the command used to launch the KCL.")]
        public bool ShouldExecute { get; set; }

        [Option('l', "log-configuration", Required = false, HelpText = "A Logback XML configuration file")]
        public string LogbackConfiguration { get; set; }
    }

    internal enum OperatingSystemCategory
    {
        UNIX,
        WINDOWS
    }

    /// <summary>
    /// The Bootstrap program helps the user download and launch the KCL multi-lang daemon (which is in java).
    /// </summary>
    internal class Bootstrap
    {
        private static readonly OperatingSystemCategory CURRENT_OS = Environment.OSVersion.ToString().Contains("Unix")
            ? OperatingSystemCategory.UNIX
            : OperatingSystemCategory.WINDOWS;

        private static readonly List<MavenPackage> MAVEN_PACKAGES = new()
        {
            new MavenPackage("software.amazon.kinesis", "amazon-kinesis-client-multilang", "2.1.2"),
            new MavenPackage("software.amazon.kinesis", "amazon-kinesis-client", "2.1.2"),
            new MavenPackage("software.amazon.awssdk", "kinesis", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "aws-cbor-protocol", "2.4.0"),
            new MavenPackage("com.fasterxml.jackson.dataformat", "jackson-dataformat-cbor", "2.9.8"),
            new MavenPackage("software.amazon.awssdk", "aws-json-protocol", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "dynamodb", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "cloudwatch", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "netty-nio-client", "2.4.0"),
            new MavenPackage("io.netty", "netty-codec-http", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-codec-http2", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-codec", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-transport", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-resolver", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-common", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-buffer", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-handler", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-transport-native-epoll", "4.1.32.Final"),
            new MavenPackage("io.netty", "netty-transport-native-unix-common", "4.1.32.Final"),
            new MavenPackage("com.typesafe.netty", "netty-reactive-streams-http", "2.0.0"),
            new MavenPackage("com.typesafe.netty", "netty-reactive-streams", "2.0.0"),
            new MavenPackage("org.reactivestreams", "reactive-streams", "1.0.2"),
            new MavenPackage("com.google.guava", "guava", "26.0-jre"),
            new MavenPackage("com.google.code.findbugs", "jsr305", "3.0.2"),
            new MavenPackage("org.checkerframework", "checker-qual", "2.5.2"),
            new MavenPackage("com.google.errorprone", "error_prone_annotations", "2.1.3"),
            new MavenPackage("com.google.j2objc", "j2objc-annotations", "1.1"),
            new MavenPackage("org.codehaus.mojo", "animal-sniffer-annotations", "1.14"),
            new MavenPackage("com.google.protobuf", "protobuf-java", "2.6.1"),
            new MavenPackage("org.apache.commons", "commons-lang3", "3.8.1"),
            new MavenPackage("org.slf4j", "slf4j-api", "1.7.25"),
            new MavenPackage("io.reactivex.rxjava2", "rxjava", "2.1.14"),
            new MavenPackage("software.amazon.awssdk", "sts", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "aws-query-protocol", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "protocol-core", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "profiles", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "sdk-core", "2.4.0"),
            new MavenPackage("com.fasterxml.jackson.core", "jackson-core", "2.9.8"),
            new MavenPackage("com.fasterxml.jackson.core", "jackson-databind", "2.9.8"),
            new MavenPackage("software.amazon.awssdk", "auth", "2.4.0"),
            new MavenPackage("software.amazon", "flow", "1.7"),
            new MavenPackage("software.amazon.awssdk", "http-client-spi", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "regions", "2.4.0"),
            new MavenPackage("com.fasterxml.jackson.core", "jackson-annotations", "2.9.0"),
            new MavenPackage("software.amazon.awssdk", "annotations", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "utils", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "aws-core", "2.4.0"),
            new MavenPackage("software.amazon.awssdk", "apache-client", "2.4.0"),
            new MavenPackage("org.apache.httpcomponents", "httpclient", "4.5.6"),
            new MavenPackage("commons-codec", "commons-codec", "1.10"),
            new MavenPackage("org.apache.httpcomponents", "httpcore", "4.4.10"),
            new MavenPackage("com.amazonaws", "aws-java-sdk-core", "1.11.477"),
            new MavenPackage("commons-logging", "commons-logging", "1.1.3"),
            new MavenPackage("software.amazon.ion", "ion-java", "1.0.2"),
            new MavenPackage("joda-time", "joda-time", "2.8.1"),
            new MavenPackage("ch.qos.logback", "logback-classic", "1.2.3"),
            new MavenPackage("ch.qos.logback", "logback-core", "1.2.3"),
            new MavenPackage("com.beust", "jcommander", "1.72"),
            new MavenPackage("commons-io", "commons-io", "2.6"),
            new MavenPackage("org.apache.commons", "commons-collections4", "4.2"),
            new MavenPackage("commons-beanutils", "commons-beanutils", "1.9.3"),
            new MavenPackage("commons-collections", "commons-collections", "3.2.2")
        };

        /// <summary>
        /// Downloads all the required jars from Maven and returns a classpath string that includes all those jars.
        /// </summary>
        /// <returns>Classpath string that includes all the jars downloaded.</returns>
        /// <param name="jarFolder">Folder into which to save the jars.</param>
        private static string FetchJars(string jarFolder)
        {
            if (jarFolder == null)
            {
                jarFolder = "jars";
            }

            if (!Path.IsPathRooted(jarFolder))
            {
                jarFolder = Path.Combine(Directory.GetCurrentDirectory(), jarFolder);
            }

            Console.Error.WriteLine("Fetching required jars...");

            foreach (var mp in MAVEN_PACKAGES)
            {
                mp.Fetch(jarFolder);
            }

            Console.Error.WriteLine("Done.");

            var files = Directory.GetFiles(jarFolder).Where(f => f.EndsWith(".jar")).ToList();
            files.Add(Directory.GetCurrentDirectory());
            return string.Join(Path.PathSeparator.ToString(), files);
        }

        private static string FindJava(string java)
        {
            // See if "java" is already in path and working.
            if (java == null)
            {
                java = "java";
            }

            var proc = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = java,
                    Arguments = "-version",
                    UseShellExecute = false
                }
            };
            try
            {
                proc.Start();
                proc.WaitForExit();
                return java;
            }
            catch (Exception)
            {
            }

            // Failing that, look in the registry.
            if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows))
            {
                foreach (var view in new[] { RegistryView.Registry64, RegistryView.Registry32 })
                {
                    var localKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, view);
                    var javaRootKey = localKey.OpenSubKey(@"SOFTWARE\WOW6432Node\JavaSoft\Java Runtime Environment");
                    foreach (var jreKeyName in javaRootKey.GetSubKeyNames())
                    {
                        var jreKey = javaRootKey.OpenSubKey(jreKeyName);
                        var javaHome = jreKey.GetValue("JavaHome") as string;
                        var javaExe = Path.Combine(javaHome, "bin", "java.exe");
                        if (File.Exists(javaExe))
                        {
                            return javaExe;
                        }
                    }
                }
            }

            return null;
        }

        public static void Run(string[] args)
        {
            var parserResult = Parser.Default.ParseArguments<Options>(args);

            parserResult.WithParsed(options =>
            {
                var javaClassPath = FetchJars(options.JarFolder);

                var java = FindJava(options.JavaLocation);

                if (java == null)
                {
                    Console.Error.WriteLine(
                        "java could not be found. You may need to install it, or manually specify the path to it.");

                    Environment.Exit(2);
                }

                var cmd = new List<string>()
                {
                    java,
                    "-cp",
                    javaClassPath,
                    "software.amazon.kinesis.multilang.MultiLangDaemon",
                    "-p",
                    options.PropertiesFile
                };
                if (!string.IsNullOrEmpty(options.LogbackConfiguration))
                {
                    cmd.Add("-l");
                    cmd.Add(options.LogbackConfiguration);
                }
                if (options.ShouldExecute)
                {
                    // Start the KCL.
                    var proc = new Process
                    {
                        StartInfo = new ProcessStartInfo
                        {
                            FileName = cmd[0],
                            Arguments = string.Join(" ", cmd.Skip(1)),
                            UseShellExecute = false
                        }
                    };
                    proc.Start();
                    proc.WaitForExit();
                }
                else
                {
                    // Print out a command that can be used to start the KCL.
                    var c = string.Join(" ", cmd.Select(f => "\"" + f + "\""));
                    if (CURRENT_OS == OperatingSystemCategory.WINDOWS)
                    {
                        c = "& " + c;
                    }

                    Console.WriteLine(c);
                }
            });
        }

        private static FrameworkWrapper _fw;

        public static Process RunAsService(FrameworkWrapper fw, string[] args)
        {
            _fw = fw;

            var parserResult = Parser.Default.ParseArguments<Options>(args);

            Process proc = null;

            parserResult.WithParsed(options =>
            {
                var javaClassPath = FetchJars(options.JarFolder);
                var java = FindJava(options.JavaLocation);

                if (java == null)
                {
                    throw new InvalidOperationException("java could not be found. You may need to install it, or manually specifiy the path to it.");
                }

                var cmd = new List<string>()
                {
                    java,
                    "-cp",
                    javaClassPath,
                    "software.amazon.kinesis.multilang.MultiLangDaemon",
                    "-p",
                    options.PropertiesFile
                };

                var c = string.Join(" ", cmd.Select(f => "\"" + f + "\""));

                // Start the KCL.
                proc = new Process();

                var startInfo = new ProcessStartInfo
                {
                    FileName = cmd[0],
                    Arguments = string.Join(" ", cmd.Skip(1)),
                    UseShellExecute = false,
                    RedirectStandardError = true,
                };
                _fw.StartupConfiguration.GetD("Config/EnvironmentVariables").ForEach(x => startInfo.EnvironmentVariables[x.Item1] = x.Item2);
                proc.StartInfo = startInfo;

                proc.ErrorDataReceived += JavaProcess_ErrorDataReceived;
                proc.Start();
                proc.BeginErrorReadLine();
            });

            return proc;
        }

        private static void JavaProcess_ErrorDataReceived(object sender, DataReceivedEventArgs e) => _fw.Error("AwsKinesisConsumerDataLib", $"Java message: {e.Data}");
    }
}