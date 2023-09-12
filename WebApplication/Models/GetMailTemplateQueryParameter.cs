using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// メールテンプレート取得時のパラメータ
    /// </summary>
    public class GetMailTemplateQueryParameter
    {
        /// <summary>
        /// アラーム種別
        /// </summary>
        public AlarmCategory AlarmCategory { get; set; }

        /// <summary>
        /// データ種別
        /// </summary>
        public DataType DataType { get; set; }

        /// <summary>
        /// イベント種別
        /// </summary>
        public int EventType { get; set; }

    }
}