using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// 埋込レポート用パラメータ
    /// </summary>
    public class EmbeddedReportQueryParameter
    {
        /// <summary>
        /// ラックID
        /// </summary>
        public string RackId { get; set; }

        /// <summary>
        /// ファイル名
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// フォーマット
        /// </summary>
        public EmbeddedReportFormat EmbeddedReportFormat { get; set; }

        /// <summary>
        /// 上書き可否
        /// </summary>
        public bool AllowOverwriting { get; set; }

        /// <summary>
        /// フォーマットチェック有無
        /// </summary>
        public bool CheckFormat { get; set; }

        /// <summary>
        /// データ文字列（Base64）
        /// </summary>
        public string DataString { get; set; }

    }
}