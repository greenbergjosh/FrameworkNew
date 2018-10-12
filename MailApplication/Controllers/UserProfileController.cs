using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BusinessLogic;
using BusinessLogic.Model;
using SharpRaven;
using SharpRaven.Data;
using WebMatrix.WebData;
using System.Web.Security;

namespace MailApplication.Controllers
{
    [Authorize(Roles = "DOMAIN ADMIN, SUPER USER")]
    public class UserProfileController : Controller
    {
        // GET: UserProfile
        public ActionResult Index()
        {

            using (CredentialContext db = new CredentialContext())
            {
                IQueryable<UserProfile> query = db.UserProfiles;

                var result = query.ToArray();

                return View(result);
            }
        }

        public ActionResult New()
        {

            SelectList providerList = new SelectList(Roles.GetAllRoles().ToArray());
            ViewBag.items = providerList;
            return View();

        }

        public ActionResult Create(string name, string userName, string password, string confirmPassword, string role)
        {
            try
            {
                if (password.Equals(confirmPassword))
                {
                    WebSecurity.CreateUserAndAccount(userName, password);

                    var roles = (SimpleRoleProvider)Roles.Provider;
                    roles.AddUsersToRoles(new[] { userName }, new[] { role });

                }
                else
                {
                    return Redirect("New");
                }

            }
            catch (Exception ex)
            {
                RavenClient ravenClient = BusinessLogic.Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }

            return Redirect("Index");


        }

        public ActionResult Edit(int id)
        {
            using (CredentialContext db = new CredentialContext())
            {

                UserProfile user = db.UserProfiles.Find(id);

                return View(user);
            }
        }

        public ActionResult Update(String userName, String password, String newPassword)
        {

            using (CredentialContext db = new CredentialContext())
            {

                bool changePass = WebSecurity.ChangePassword(userName, password, newPassword);

                try
                {
                    UserProfile user = db.UserProfiles.Where(u => u.UserName.Equals(userName)).First();
                    user.UserName = userName;

                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = BusinessLogic.Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return Redirect("Index");
            }
        }

        public ActionResult Delete(int userId)
        {
            using (CredentialContext db = new CredentialContext())
            {

                UserProfile user = db.UserProfiles.Find(userId);

                ((SimpleMembershipProvider)Membership.Provider).DeleteAccount(user.UserName);

                foreach (var role in Roles.GetRolesForUser(user.UserName))
                    Roles.RemoveUserFromRole(user.UserName, role);

                ((SimpleMembershipProvider)Membership.Provider).DeleteUser(user.UserName, true);


            }

            return Redirect("/UserProfile/Index");

        }

    }
}