using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// テンプレート検索時のパラメータ
    /// </summary>
    public class SearchTemplatesParameter
    {
        /// <summary>
        /// テンプレート名称
        /// </summary>
        public IEnumerable<string> TemplateName { get; set; }

        /// <summary>
        /// テンプレートメモ
        /// </summary>
        public IEnumerable<string> TemplateMemo { get; set; }
    }
}