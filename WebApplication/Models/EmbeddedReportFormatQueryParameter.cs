using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// 帳票出力フォーマット用パラメータ
    /// </summary>
    public class EmbeddedReportFormatQueryParameter
    {
        /// <summary>
        /// フォーマット
        /// </summary>
        public EmbeddedReportFormat EmbeddedReportFormat { get; set; }

        /// <summary>
        /// データ文字列（Base64）
        /// </summary>
        public string DataString { get; set; }

        /// <summary>
        /// 上書き可否
        /// </summary>
        public bool AllowOverwriting { get; set; }
    }
}