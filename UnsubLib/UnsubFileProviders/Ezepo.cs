using System;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Utility;
using Utility.GenericEntity;
using Utility.Selenium;

namespace UnsubLib.UnsubFileProviders
{
    public class Ezepo : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _seleniumChromeDriverPath;
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Ezepo)}";

        public Ezepo(FrameworkWrapper fw, string seleniumChromeDriverPath)
        {
            _fw = fw;
            _seleniumChromeDriverPath = seleniumChromeDriverPath;
        }

        public bool CanHandle(IGenericEntity network, Uri uri) => uri.ToString().Contains("ezepo.net");

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            await _fw.Trace(_logMethod, $"Getting Unsub location: {uri}");

            var ezepoUnsubUrl = await GetEzepoUnsubFileUri(uri.ToString());

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {ezepoUnsubUrl}");

            if (ezepoUnsubUrl != "") return ezepoUnsubUrl;

            await _fw.Error(_logMethod, $"Empty Ezepo url: {uri}");

            return null;
        }

        public async Task<string> GetEzepoUnsubFileUri(string url)
        {
            var fileUrl = "";
            //var chromeOptions = new ChromeOptions();
            //chromeOptions.AddUserProfilePreference("download.default_directory", @"e:\workspace\unsub");
            //chromeOptions.AddUserProfilePreference("intl.accept_languages", "nl");
            //chromeOptions.AddUserProfilePreference("disable-popup-blocking", "true");
            //var driver = new ChromeDriver(this.SeleniumChromeDriverPath, chromeOptions);
            try
            {
                using (var driver = new ChromeDriver(_seleniumChromeDriverPath))
                {
                    await driver.GoToUrlAndWaitForDocument(url, TimeSpan.FromSeconds(30));

                    var button = await driver.FindElementWhenDisplayed(By.XPath("//button[.='Download All Data']"), TimeSpan.FromSeconds(30));

                    if (button == null) throw new Exception("Failed to retrieve 'Download All Data' button");

                    button.Click();
                    IWebElement dwnldLink = null;
                    var retryCount = 0;
                    var retryWalkaway = new[] { 1, 10, 50, 100, 300 };
                    while (retryCount < 5)
                    {
                        try
                        {
                            dwnldLink = driver.FindElement(By.Id("downloadlink"));
                            if (dwnldLink.Displayed) break;
                            else throw new Exception();
                        }
                        catch (Exception ex)
                        {
                            await Task.Delay(retryWalkaway[retryCount] * 1000);
                        }
                    }

                    if (dwnldLink != null)
                    {
                        //dwnldLink.Click();
                        fileUrl = dwnldLink.GetAttribute("href");
                    }

                    driver.Quit();
                }
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetEzepoUnsubFileUri), $"Selenium failed {e.UnwrapForLog()}");
            }

            return fileUrl;
        }

    }

}
