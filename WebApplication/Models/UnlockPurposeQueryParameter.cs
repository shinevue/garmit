using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class UnlockPurposeQueryParameter
    {
        public UnlockPurpose UnlockPurpose { get; set; }
        public Function.FUNCTION_ID_e FunctionId { get; set; }
    }
}