using System;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace Utility.Selenium
{
    public static class Extensions
    {
        public static IWebElement FindElementOrDefault(this IWebDriver driver, By by)
        {
            try { return driver.FindElement(by); }
            catch (Exception e) { return null; }
        }

        public static async Task<IWebElement> FindElementWhenDisplayed(this IWebDriver driver, By by, TimeSpan timeout, TimeSpan? pollingInterval = null)
        {
            pollingInterval = pollingInterval ?? TimeSpan.FromSeconds(1);
            IWebElement element = driver.FindElementOrDefault(by);
            var timesOut = DateTime.Now.Add(timeout);

            while (element?.Displayed != true && DateTime.Now < timesOut)
            {
                await Task.Delay(pollingInterval.Value);
                element = driver.FindElementOrDefault(by);
            }

            return element;
        }

        public static async Task GoToUrlAndWaitForDocument(this ChromeDriver driver, string url, TimeSpan timeout, TimeSpan? pollingInterval = null)
        {
            driver.Navigate().GoToUrl(url);

            if (pollingInterval == null)
            {
                await Task.Delay(500);
                pollingInterval = TimeSpan.FromMilliseconds(1000);
            }
            else await Task.Delay(pollingInterval.Value);

            var js = (IJavaScriptExecutor)driver;
            string result = null;
            var timesOut = DateTime.Now.Add(timeout);

            bool loaded() => result == "complete";
            string poll()
            {
                try { return (string)js.ExecuteScript("return document.readyState"); }
                catch (Exception e) { return null; }
            }

            poll();

            while (!loaded() && DateTime.Now < timesOut)
            {
                await Task.Delay(pollingInterval.Value);
                result = poll();
            }

            if (loaded()) return;

            throw new Exception($"Document load timed out. Last JS result {result ?? null}");
        }

    }
}
