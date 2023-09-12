using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// ビューに表示するデータモデル
    /// </summary>
    public class ViewModel
    {
        public string Title { get; set; }
        public string IconClass { get; set; }
        public string FunctionName { get; set; }
        public Dictionary<string, string> AppSettings { get; set; }
        public int? SystemId { get; set; }
        public HttpErrorMessage ErrorMessage { get; set; }
    }
}