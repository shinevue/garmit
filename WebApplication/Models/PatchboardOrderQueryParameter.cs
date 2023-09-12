using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using garmit.DomainObject;

namespace garmit.Web.Models
{
    public class PatchboardOrderQueryParameter
    {
        public bool IsInpatchboard { get; set; }

        public IEnumerable<PatchboardOrder> PatchboardOrders { get; set; }
    }
}