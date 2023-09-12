using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class UnitsSetQueryParameter
    {
        /// <summary>
        /// 更新するユニットの配列
        /// </summary>
        public IEnumerable<Unit> Units { get; set; }

        /// <summary>
        /// 更新前に所属していた表示設定ID
        /// </summary>
        public string DispSetId { get; set; }

        /// <summary>
        /// 更新先のラック
        /// </summary>
        public Rack Rack { get; set; }
    }
}