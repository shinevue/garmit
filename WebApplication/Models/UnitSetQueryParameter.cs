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
    public class UnitSetQueryParameter
    {
        /// <summary>
        /// 更新するユニット
        /// </summary>
        public Unit Unit { get; set; }
        
        /// <summary>
        /// ユニットの所属するラックID
        /// </summary>
        public string RackId { get; set; }
    }
}