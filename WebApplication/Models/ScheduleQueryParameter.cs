using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// メンテナンススケジュール保存のパラメータ
    /// </summary>
    public class ScheduleQueryParameter
    {
        /// <summary>
        /// 編集前のスケジュール
        /// </summary>
        public MaintenanceSchedule originalSchedule { get; set; }

        /// <summary>
        /// 編集後のスケジュール
        /// </summary>
        public MaintenanceSchedule saveSchedule { get; set; }
    }
}