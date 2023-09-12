using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// 計測値取得時のパラメータ
    /// </summary>
    public class GetValueQueryParameter
    {
        /// <summary>
        /// 選択中オブジェクト
        /// </summary>
        public LayoutObject SelectObject { get; set; }
        
        /// <summary>
        /// 換算するかどうか
        /// </summary>
        public bool IsConvert { get; set; }
    }
}