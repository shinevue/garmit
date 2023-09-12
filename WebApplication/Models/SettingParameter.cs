using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// デフォルト設定保存時のパラメータ
    /// </summary>
    public class SettingParameter
    {
        /// <summary>
        /// システム設定
        /// </summary>
        public SystemSet SystemSet { get; set; }

        /// <summary>
        /// データ種別
        /// </summary>
        public IEnumerable<DataType> DataTypes { get; set; }

    }
}