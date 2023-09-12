using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class ReportScheduleQueryParameter
    {
        public int ScheduleId { get; set; }
        public IEnumerable<int> ScheduleIds { get; set; }
        public int EnterpriseId { get; set; }
        public ReportSchedule ReportSchedule { get; set; }
        public IEnumerable<int> FileNos { get; set; }
    }
}