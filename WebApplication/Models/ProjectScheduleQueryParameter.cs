using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class ProjectScheduleQueryParameter
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}