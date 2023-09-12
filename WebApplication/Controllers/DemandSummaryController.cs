﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Filter;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    [RoutePrefix("DemandSummary")]
    public class DemandSummaryController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.DemandSummary);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "デマンドサマリ",
                        FunctionName = viewModel.FunctionName,
                        IconClass = viewModel.IconClass,
                    }
                );
            }
            else
            {
                TempData = viewModel.TempData;
                return RedirectToAction(viewModel.ActionName, viewModel.ControllerName);
            }
        }
    }
}