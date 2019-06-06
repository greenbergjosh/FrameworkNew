using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace Channel.Admin.Dashboard.Controllers
{
	public class DashboardController : Controller
	{


		public ActionResult Index()
		{
			return View(new DashboardRootViewModel
			{
			});
		}
		public class DashboardRootViewModel
		{
			public string Page { get; set; }
		}
	}
}
