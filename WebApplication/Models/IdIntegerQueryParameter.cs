using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class IdIntegerQueryParameter
    {
        public int Id { get; set; }
        public IEnumerable<int> Ids { get; set; }
    }
}