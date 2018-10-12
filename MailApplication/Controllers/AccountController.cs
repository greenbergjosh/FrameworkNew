using System;
using BusinessLogic;
using System.Web.Mvc;
using SharpRaven.Data;
using SharpRaven;
using MailApplication.Filters;
using WebMatrix.WebData;
using System.Net.Mail;
using System.Configuration;

namespace MailApp.Controllers
{
    [InitializeSimpleMembership]
    public class AccountController : Controller
    {
        public ActionResult Login()
        {

            return View();

        }

        public ActionResult CheckMembership(String user, String pass)
        {
            try
            {
                if (user != "" && pass != "")
                {
                    if (WebSecurity.Login(user, pass, persistCookie: false))
                    {
                        return Redirect("/Mail/Index");
                    }
                }

            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }

            return Redirect("/Account/Login");
        }

        public ActionResult Logout()
        {
            try
            {

                WebSecurity.Logout();
                return Redirect("/Account/login");
            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }

            return Redirect("/Mail/Index");

        }

        public ActionResult RecoverPasswordSendMessage(String email)
        {
            try
            {
                String token = GenerateTokenResetPassword(email);

                var msg = new MailMessage();
                msg.From = new MailAddress(email);
                msg.To.Add(email);
                msg.Subject = "Reset Password";

                string url = ConfigurationManager.AppSettings["url"].ToString();

                msg.Body = "Plase click the link to change the password "+url+"/Account/ForgotPassword?token=" + token;

                MailClient extractor = new MailClient();
                extractor.SendSmtpMessage(email, msg);

            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
                return Redirect("/Account/login");
            }

            return Redirect("/Account/login");
        }

        public ActionResult ForgotPassword()
        {

            return View();

        }

        public ActionResult ChangePassword(String user, String password, String token)
        {
            try
            {

                bool changeSuccess = WebSecurity.ResetPassword(token, password);
                if (changeSuccess)
                    return Redirect("/Account/login");

            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }

            return Redirect("/Account/ForgotPassword");
        }


        public String GenerateTokenResetPassword(String userName)
        {
            String resetToken = "";
            try
            {
                resetToken = WebSecurity.GeneratePasswordResetToken(userName, 1440);
            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }

            return resetToken;
        }

    }


}

