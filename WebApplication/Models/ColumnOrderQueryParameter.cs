using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// ユニット保存時のパラメータ
    /// </summary>
    public class ColumnOrderQueryParameter
    {
        /// <summary>
        /// 機能番号
        /// </summary>
        public Function.FUNCTION_ID_e FunctionId { get; set; }

        /// <summary>
        /// 表示列設定の対象表番号
        /// </summary>
        public int GridNo { get; set; }
    }
}