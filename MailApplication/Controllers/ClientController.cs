using BusinessLogic;
using BusinessLogic.Model;
using PagedList;
using SharpRaven;
using SharpRaven.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace MailApplication.Controllers
{
    [Authorize(Roles = "USER, SUPER USER")]
    public class ClientController : Controller
    {
        // GET: Client
        public ViewResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                int pageSize = 20;
                int pageNumber = (page ?? 1);

                IQueryable<Client> query = db.Client;

                var result = query.OrderByDescending(q => q.Id).ToPagedList(pageNumber, pageSize);

                return View(result);
            }
        }

        public ActionResult New()
        {
            return View();

        }

        public ActionResult Create(String name, String description)
        {
            if (HttpContext.Request.HttpMethod == "POST")
            {
                using (DatabaseContext db = new DatabaseContext())
                {
                    try
                    {
                        using (var cryptoProvider = new RNGCryptoServiceProvider())
                        {
                            Regex base58replacement = new Regex("[0OIl+\\/]");
                            byte[] secretKeyByteArray = new byte[32]; //256 bit
                            cryptoProvider.GetBytes(secretKeyByteArray);
                            var apiKeyBase64 = Convert.ToBase64String(secretKeyByteArray);

                            var apiKeyBase58 = base58replacement.Replace(apiKeyBase64, "");


                            Client client = new Client
                            {
                                Id = Guid.NewGuid(),
                                Name = name,
                                Description = description,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now,
                                ApiKey = apiKeyBase58
                            };

                            if (!client.Name.Equals(""))
                            {
                                db.Client.Add(client);
                                db.SaveChanges();
                            }

                        }
                    }
                    catch (Exception ex)
                    {
                        RavenClient ravenClient = Sentry.Instance;
                        ravenClient.Capture(new SentryEvent(ex));
                    }
                }
                return Redirect("Index");
            }
            return View();

        }

        public ActionResult Edit(Guid id)
        {
            using (var db = new DatabaseContext())
            {

                Client client = db.Client.Find(id);

                return View(client);
            }
        }

        public ActionResult Update(Guid idClient, String name, String description, String apiKey)
        {

            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    Client client = db.Client.Find(idClient);
                    client.Name = name;
                    client.Description = description;
                    client.UpdatedAt = DateTime.Now;
                    client.ApiKey = apiKey;
                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return Redirect("Index");
            }
        }

        public ActionResult Delete(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    Client client = db.Client.Find(id);
                    db.Client.Remove(client);

                    db.SaveChanges();
                }
                catch (Exception ex)
                {

                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/Client/Index");
            }

        }

        public String ChangeApiKey()
        {
            using (var cryptoProvider = new RNGCryptoServiceProvider())
            {
                Regex base58replacement = new Regex("[0OIl+\\/]");
                byte[] secretKeyByteArray = new byte[32]; //256 bit
                cryptoProvider.GetBytes(secretKeyByteArray);
                var apiKeyBase64 = Convert.ToBase64String(secretKeyByteArray);

                var apiKeyBase58 = base58replacement.Replace(apiKeyBase64, "");

                return apiKeyBase58;
            }

        }
    }
}