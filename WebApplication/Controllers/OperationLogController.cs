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
    public class OperationLogController : Controller
    {
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.OperationLog);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "オペレーションログ",
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