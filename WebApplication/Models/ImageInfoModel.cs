using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Models
{
    /// <summary>
    /// 画像リストモデル
    /// </summary>
    public class ImageInfoModel
    {
        /// <summary>
        /// ファイル名称
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// URL
        /// </summary>
        public string Url { get; set; }
    }
}