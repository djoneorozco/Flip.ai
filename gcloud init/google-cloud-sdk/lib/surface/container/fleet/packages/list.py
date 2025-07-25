# -*- coding: utf-8 -*- #
# Copyright 2024 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Command to list all Fleet Packages."""

from googlecloudsdk.api_lib.container.fleet.packages import fleet_packages as apis
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.container.fleet.packages import flags
from googlecloudsdk.command_lib.container.fleet.packages import utils

_DETAILED_HELP = {
    'DESCRIPTION': '{description}',
    'EXAMPLES': """ \
        To list all Fleet Packages in `us-central1`, run:

          $ {command} --location=us-central1
        """,
}

# For more formatting options see:
# http://cloud/sdk/gcloud/reference/topic/formats
_FORMAT = """table(name.basename():label=NAME,
                   info.State:label=STATE,
                   createTime.date(tz=LOCAL):label=CREATE_TIME,
                   info.activeRollout.basename():label=ACTIVE_ROLLOUT,
                   info.lastCompletedRollout.basename():label=LAST_COMPLETED_ROLLOUT,
                   fleet_package_errors():label=MESSAGES)"""


@base.DefaultUniverseOnly
@base.ReleaseTracks(base.ReleaseTrack.BETA)
class List(base.ListCommand):
  """List Package Rollouts Fleet Packages."""

  detailed_help = _DETAILED_HELP
  _api_version = 'v1beta'

  @classmethod
  def Args(cls, parser):
    parser.display_info.AddFormat(_FORMAT)
    parser.display_info.AddTransforms(
        {'fleet_package_errors': utils.TransformListFleetPackageErrors}
    )
    flags.AddUriFlags(parser, apis.FLEET_PACKAGE_COLLECTION, cls._api_version)

    flags.AddLocationFlag(parser)

  def Run(self, args):
    """Run the list command."""
    client = apis.FleetPackagesClient(self._api_version)
    return client.List(
        project=flags.GetProject(args),
        location=flags.GetLocation(args),
        limit=args.limit,
        page_size=args.page_size,
    )


@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
class ListAlpha(List):
  """List Package Rollouts Fleet Packages."""

  _api_version = 'v1alpha'
