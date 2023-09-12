using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using garmit.DomainObject;

namespace garmit.Web.Models
{
    public class LocationQueryParameter
    {
        /// <summary>
        /// 保存対象のロケーション
        /// </summary>
        public Location Location { get; set; }

        /// <summary>
        /// 追加位置の基準とするロケーションのID
        /// </summary>
        public int? SelectedLocationId { get; set; }

        /// <summary>
        /// 追加位置
        /// </summary>
        public Enumeration.LocationNodeAddPosition_e LocationNodeAddPosition { get; set; }

    }
}